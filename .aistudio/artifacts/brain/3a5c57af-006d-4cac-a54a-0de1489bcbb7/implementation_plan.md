# EventFlow: Enterprise Activity Planning & Task Management System

EventFlow is a specialized activity planning and task governance platform built for event committees and project organizers. It streamlines end-to-end event execution through structured phases, recurring milestones, deliverable tracking, Google Docs export, and role-based editing authorizations.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on your Phase 1 selections:

- **Confirmed Decision 1 (Initial Template)**: Bootstrapped with the **Annual Gala / Welfare Committee (尾牙籌辦程序)** workflow directly matching your reference document, featuring 5 execution phases (`Initiation & Planning`, `Preparation & Survey`, `Rundown & Campaign`, `Final Check`, `D-Day & Post-Event`), pre-assigned functional groups (`行政`, `財務`, `總務`, `活動`), and strict milestone deliverables.
- **Confirmed Decision 2 (Google Docs Export)**: Direct export into Google Docs generating a formatted executive dossier with structured phase tables, department responsibilities, deliverable status, and sign-off blocks using Google Docs & Drive APIs.
- **Confirmed Decision 3 (Stakeholder Notifications)**: A dedicated in-app notification center with unread badge indicators, real-time alert triggers upon task updates or sign-offs, and an activity audit log.
- **Access Control & RBAC**: A pre-registered email authorization system where the **Super Admin** (`philiponchang@gmail.com`) can review registration requests, grant or revoke editor status, and maintain read-only protection for unapproved viewers.

---

### 1. Overview & Core Concept

- **What It Does**: EventFlow transforms unstructured activity planning into a reliable operational timeline. It tracks budgets, rundowns (V0.x to V3.x), vendor contracts, deliverables, contingency simulations, and group assignments with full live state persistence.
- **Target Audience / Persona**: Welfare Committee members (`福委會`), event directors, administrative chairs (`主委`), finance leads (`財委`), general affairs (`總務`), and program coordinators (`活動`).
- **Key Value**: Prevents missed milestones, clarifies decision rules (e.g. non-majority vote matters such as budget overruns and top-executive instructions), and provides one-click export of complete operational agendas to Google Docs.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Activity Workspace & Board View**:
   - Header with event switcher (`2026 福委會 尾牙晚宴`, `2027 員工旅遊`), budget overview strip, and timeline countdown (`D-Date Countdown`).
   - Multi-view navigation: **Phase Checklist** (Chronological Table), **Kanban Team Board** (Grouped by `行政`, `財務`, `總務`, `活動`), **Deliverables Ledger**, and **Budget & Execution Tracker**.
2. **Task Creation & Inline Editing**:
   - Authorized editors can edit Lead-Time (`L-T`), Task Item, Group, Target Date, Deliverables, Status (`Not Started`, `In Progress`, `Under Review`, `Approved`, `Blocked`), and Contingency Notes.
   - Quick filters by Department Group, Phase, or Status.
3. **Super Admin Access Governance**:
   - Floating/modal Admin Portal accessible by the Super Admin to review incoming access requests, add pre-approved team emails, set committee roles, and toggle edit privileges.
   - Read-only banner for visitors not yet authorized with a 1-click "Request Edit Access" button.
4. **Google Docs Dossier Export**:
   - One-click "Export to Google Docs" button that connects via client-side Google OAuth, creates a styled Google Doc in the user's Drive, and returns an instant direct link to open the document.
5. **Real-time Notification Center**:
   - Interactive notification tray with instant toasts when tasks change status, budget overruns are submitted, or sign-offs occur. Filter by "All" or "My Group".

#### Visual Identity & Theme
- **Aesthetic Direction**: High-density executive SaaS dashboard with utilitarian precision and zero decorative clutter.
- **Color Palette & Distribution**:
  - *60% Neutral Canvas*: Slate-50 background (`#F8FAFC`) with crisp white surface cards (`#FFFFFF`) and hairline dividers (`border-slate-200`).
  - *30% Structural Elements*: Slate-900 typography, slate-600 metadata, slate-100 table headers.
  - *10% Accent System*: Indigo-600 (`#4F46E5`) for primary interactive CTAs, Amber-600 for upcoming deadlines/warnings, Emerald-600 for approved milestones.
- **Typography**: `Plus Jakarta Sans` for clean structural headlines and navigation, paired with `Public Sans` for dense table scannability and `JetBrains Mono` / `tabular-nums` for lead-times (`D-4M`, `D-2Week`), budgets, and timestamps.
- **Design Restraint**: No generic purple gradients, no static pill badge sandwiches, no floating fake status tickers, and no dead controls.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pre-seeded Domain Data vs Blank Slate**
  - *Approach*: Ships with the complete Welfare Committee Year-End Party (尾牙) dataset as default, while allowing users to create new custom activities or clone phases.
  - *Why*: Gives instant operational value right upon first launch matching the user's exact specification.
- **Decision 2: Client-Side Google Docs Integration**
  - *Approach*: Uses Google OAuth with client-side token flow to directly call the Google Docs REST API (`documents.create`, `documents.batchUpdate`) and Google Drive API (`files.create`).
  - *Why*: Follows AI Studio preview constraints, avoiding server-side redirect URI mismatch while generating authentic Google Docs documents.
- **Decision 3: Dual Persistence Strategy**
  - *Approach*: In-memory and local storage backed reactive state store with live synchronization across browser tabs and simulated multi-stakeholder broadcast channel, ensuring reliable and immediate responses.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EventFlow Application Shell                     │
├────────────────────────────────────────────────────────────────────────┤
│ Top Bar: Brand · Event Switcher · Google Docs Export · Notification Bell │
├───────────────────┬────────────────────────────────────────────────────┤
│ Left Sidebar      │ Main Content Viewport                              │
│ ───────────────── │ ────────────────────────────────────────────────── │
│ · Phase Checklist │ · Executive Progress Bar & Milestone Timeline      │
│ · Team Boards     │ · Search, Group Filter & Add Task Bar              │
│ · Deliverables    │ · High-Density Data Grid / Interactive Kanban      │
│ · Budget & Rules  │ · Task Detail & Sign-Off Drawer                   │
│ · Admin Access    │ · Notification Center Flyout                       │
└───────────────────┴────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  State Management    │        │ Google Workspace API │
    │  - Activity & Tasks  │        │ - OAuth Client Token │
    │  - RBAC & Members    │        │ - Google Docs API    │
    │  - Notifications     │        │ - Direct Document    │
    │  - Audit Trail Log   │        │   URL Generation     │
    └──────────────────────┘        └──────────────────────┘
```

#### Core Data Entities
1. **ActivityPlan**: ID, title, date, budget total, contingency budget, status, decision rules.
2. **TaskItem**: ID, code (`O.O`, `A.1`, `B.4`, `D`), phase ID, title, group (`行政` | `財務` | `總務` | `活動`), leadTime (`D-4M`, `D-2W`), deliverable, status, assignee, priority, notes.
3. **UserMember**: ID, email, name, role (`super_admin` | `chairperson` | `committee_member` | `viewer`), group, status (`active` | `pending_approval` | `rejected`), canEdit.
4. **AppNotification**: ID, title, message, type (`status_change` | `deadline_alert` | `access_request` | `export_ready`), timestamp, read, targetGroup.

---

### Implementation Phases

1. **Phase 1: Project Setup & Domain Data Structure**
   - Configure Tailwind typography and tabular numeral tokens in `index.html` and `src/index.css`.
   - Update `metadata.json` with official name "EventFlow Activity Planner" and description.
   - Build TypeScript types and pre-loaded dataset covering all 5 phases and procedural rules from the reference document.

2. **Phase 2: Core Activity & Task Management UI**
   - High-density Phase Checklist data grid with inline status transitions, edit drawer, and group filtering.
   - Interactive Kanban Team Board grouped by committee department (`行政`, `財務`, `總務`, `活動`).
   - Budget & Procedural Rules view detailing voting rules and non-majority exceptions.
   - Deliverables ledger with completion counters.

3. **Phase 3: RBAC & Member Access Control**
   - Pre-registered email authorization modal with Super Admin review portal.
   - Instant permission switching (simulate user switching between Super Admin, Committee Member, and Pending Viewer).
   - Read-only protection banner with access request submission.

4. **Phase 4: Google Docs Export Integration**
   - Client-side Google OAuth authentication configuration.
   - Google Docs document generation with structured tables, executive header, phase breakdown, and deliverable sign-offs.
   - Direct link opening and export history logging.

5. **Phase 5: Real-time Notifications & Verification**
   - Notification flyout panel with unread badge, category filters, and action links.
   - Automated triggers for task status changes, deadline countdown warnings, and access requests.
   - Full TypeScript build check and end-to-end functionality verification.
